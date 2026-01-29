package boot.team.hr.eun.payroll.service;

import boot.team.hr.eun.attendance.repo.WorkRecordRepository;
import boot.team.hr.eun.payroll.dto.PayrollMonthlyListItemDto;
import boot.team.hr.eun.payroll.dto.PayrollSummaryResponseDto;
import boot.team.hr.eun.payroll.dto.PayrollUpsertSalaryRequestDto;
import boot.team.hr.eun.payroll.entity.OvertimeAllowance;
import boot.team.hr.eun.payroll.entity.PayrollPolicy;
import boot.team.hr.eun.payroll.entity.Salary;
import boot.team.hr.eun.payroll.repo.OvertimeAllowanceRepository;
import boot.team.hr.eun.payroll.repo.PayrollPolicyRepository;
import boot.team.hr.eun.payroll.repo.SalaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.*;


@Service
@RequiredArgsConstructor
@Transactional
public class PayrollServiceImpl implements PayrollService {

    private final SalaryRepository salaryRepository;
    private final OvertimeAllowanceRepository overtimeAllowanceRepository;
    private final PayrollPolicyRepository payrollPolicyRepository;
    private final WorkRecordRepository workRecordRepository;

    @Override
    public void upsertMonthlySalaryInfo(PayrollUpsertSalaryRequestDto req) {
        if (req.getEmpId() == null || req.getEmpId().isBlank()) {
            throw new IllegalArgumentException("empId가 필요합니다.");
        }
        if (req.getPayMonth() == null || req.getPayMonth().isBlank()) {
            throw new IllegalArgumentException("payMonth가 필요합니다. (YYYY-MM-DD, 항상 1일)");
        }

        LocalDate payMonth = LocalDate.parse(req.getPayMonth());
        validatePayMonth(payMonth);

        Integer annual = req.getAnnualSalary();
        Integer base = req.getBaseSalary();
        if (annual == null && base == null) {
            throw new IllegalArgumentException("annualSalary 또는 baseSalary 중 최소 1개는 필요합니다.");
        }

        // ✅ 자동 계산 (연봉만 넣어도 월급 자동)
        if (base == null && annual != null) {
            base = calcMonthlyBaseFromAnnual(annual);
        }
        if (annual == null && base != null) {
            annual = base * 12;
        }

        // Salary upsert
        Salary salary = salaryRepository.findByEmployeeIdAndPayMonth(req.getEmpId(), payMonth)
                .orElseGet(() -> Salary.create(req.getEmpId(), payMonth));
        salary.changeSalaryInfo(annual, base);

        // ✅ WorkRecord 월 합계로 salary totals 갱신 + totalSalary 계산까지
        PayrollPolicy policy = getLatestPolicy();
        MonthRange range = MonthRange.of(payMonth);

        int totalNormal = workRecordRepository.sumNormalMinutesByEmpAndMonth(req.getEmpId(), range.start, range.end);
        int totalUnpaid = workRecordRepository.sumUnpaidMinutesByEmpAndMonth(req.getEmpId(), range.start, range.end);

        int totalSalary = calcTotalSalary(base, totalUnpaid, policy.getWorkMinutesPerMonth());

        salary.applyMonthlyTotals(totalNormal, totalUnpaid, totalSalary);
        salaryRepository.save(salary);

        // ✅ overtime_allowance row도 같이 생성/유지 (금액/분은 마감 때 채움)
        OvertimeAllowance ov = overtimeAllowanceRepository.findByEmployeeIdAndPayMonth(req.getEmpId(), payMonth)
                .orElseGet(() -> OvertimeAllowance.create(req.getEmpId(), payMonth));
        overtimeAllowanceRepository.save(ov);
    }

    @Override
    public void closeMonthlyPayroll(LocalDate payMonth) {
        validatePayMonth(payMonth);

        PayrollPolicy policy = getLatestPolicy();
        MonthRange range = MonthRange.of(payMonth);

        // 마감 대상: 해당 payMonth에 Salary가 존재하는 사원들 기준(가장 안전)
        List<Salary> salaries = salaryRepository.findAllByPayMonth(payMonth);

        for (Salary salary : salaries) {
            String empId = salary.getEmployeeId();

            // (1) Salary totals도 한 번 더 최신화
            int totalNormal = workRecordRepository.sumNormalMinutesByEmpAndMonth(empId, range.start, range.end);
            int totalUnpaid = workRecordRepository.sumUnpaidMinutesByEmpAndMonth(empId, range.start, range.end);
            int totalSalary = calcTotalSalary(salary.getBaseSalary(), totalUnpaid, policy.getWorkMinutesPerMonth());
            salary.applyMonthlyTotals(totalNormal, totalUnpaid, totalSalary);
            salaryRepository.save(salary);

            // (2) Overtime 합계/금액 계산 → OVERTIME_ALLOWANCE 저장
            int totalOvertime = workRecordRepository.sumOvertimeMinutesByEmpAndMonth(empId, range.start, range.end);
            int ovAmount = calcOvertimeAmount(
                    salary.getBaseSalary(),
                    policy.getWorkMinutesPerMonth(),
                    policy.getRateMultiplier(),
                    totalOvertime
            );

            OvertimeAllowance ov = overtimeAllowanceRepository.findByEmployeeIdAndPayMonth(empId, payMonth)
                    .orElseGet(() -> OvertimeAllowance.create(empId, payMonth));

            ov.applyTotals(totalOvertime, ovAmount);
            overtimeAllowanceRepository.save(ov);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PayrollSummaryResponseDto getPayrollSummary(String empId, LocalDate payMonth) {
        validatePayMonth(payMonth);

        Salary salary = salaryRepository.findByEmployeeIdAndPayMonth(empId, payMonth)
                .orElseThrow(() -> new IllegalStateException("해당 월의 급여 정보가 없습니다. 먼저 급여 정보를 저장하세요."));

        OvertimeAllowance ov = overtimeAllowanceRepository.findByEmployeeIdAndPayMonth(empId, payMonth)
                .orElseGet(() -> OvertimeAllowance.create(empId, payMonth)); // 없으면 0으로 보여주기

        int grand = safe(salary.getTotalSalary()) + safe(ov.getTotalOvAmount());

        return PayrollSummaryResponseDto.builder()
                .empId(empId)
                .payMonth(payMonth)
                .annualSalary(salary.getAnnualSalary())
                .baseSalary(salary.getBaseSalary())
                .totalNormalMinutes(salary.getTotalNormalMinutes())
                .totalUnpaidMinutes(salary.getTotalUnpaidMinutes())
                .totalSalary(salary.getTotalSalary())
                .totalOvertimeMinutes(ov.getTotalOvertimeMinutes())
                .totalOvAmount(ov.getTotalOvAmount())
                .grandTotal(grand)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollMonthlyListItemDto> getMonthlyPayrollList(LocalDate payMonth) {
        validatePayMonth(payMonth);

        // 1) Salary 기준으로 월 리스트 구성(= 급여정보가 저장된 사원들)
        List<Salary> salaries = salaryRepository.findAllByPayMonth(payMonth);
        if (salaries.isEmpty()) return List.of();

        // 2) overtime_allowance 한 번에 매칭하려고 map 구성
        //    (repo에 findAllByPayMonth가 없으니 salary의 empId로 개별 조회해도 되지만,
        //     성능 위해 repo 메서드 추가하는 걸 추천. 아래는 "repo 추가 없이" 동작하는 버전.)
        List<PayrollMonthlyListItemDto> result = new ArrayList<>();

        for (Salary s : salaries) {
            String empId = s.getEmployeeId();

            OvertimeAllowance ov = overtimeAllowanceRepository
                    .findByEmployeeIdAndPayMonth(empId, payMonth)
                    .orElseGet(() -> OvertimeAllowance.create(empId, payMonth));

            int grand = safe(s.getTotalSalary()) + safe(ov.getTotalOvAmount());

            result.add(PayrollMonthlyListItemDto.builder()
                    .empId(empId)
                    .payMonth(payMonth)
                    .annualSalary(s.getAnnualSalary())
                    .baseSalary(s.getBaseSalary())
                    .totalNormalMinutes(s.getTotalNormalMinutes())
                    .totalUnpaidMinutes(s.getTotalUnpaidMinutes())
                    .totalSalary(s.getTotalSalary())
                    .totalOvertimeMinutes(ov.getTotalOvertimeMinutes())
                    .totalOvAmount(ov.getTotalOvAmount())
                    .grandTotal(grand)
                    .build());
        }

        // empId 오름차순 정렬(원하면 사번 정렬 규칙 맞춰 변경)
        result.sort(Comparator.comparing(PayrollMonthlyListItemDto::getEmpId));
        return result;
    }

    // ===== helpers =====

    private void validatePayMonth(LocalDate payMonth) {
        if (payMonth.getDayOfMonth() != 1) {
            throw new IllegalArgumentException("payMonth는 항상 1일이어야 합니다. 예) 2026-01-01");
        }
    }

    private PayrollPolicy getLatestPolicy() {
        List<PayrollPolicy> list = payrollPolicyRepository.findLatestFirst();
        if (list.isEmpty()) throw new IllegalStateException("PAYROLL_POLICY가 없습니다.");
        PayrollPolicy p = list.get(0);
        if (p.getWorkMinutesPerMonth() == null || p.getWorkMinutesPerMonth() <= 0) {
            throw new IllegalStateException("PAYROLL_POLICY.work_minutes_per_month가 올바르지 않습니다.");
        }
        if (p.getRateMultiplier() == null) {
            throw new IllegalStateException("PAYROLL_POLICY.rate_multiplier가 없습니다.");
        }
        return p;
    }

    private int calcMonthlyBaseFromAnnual(int annualSalary) {
        return BigDecimal.valueOf(annualSalary)
                .divide(BigDecimal.valueOf(12), 0, RoundingMode.HALF_UP)
                .intValueExact();
    }

    private int calcTotalSalary(int baseSalary, int unpaidMinutes, int workMinutesPerMonth) {
        if (baseSalary <= 0) return 0;
        if (unpaidMinutes <= 0) return baseSalary;

        BigDecimal base = BigDecimal.valueOf(baseSalary);
        BigDecimal unpaid = BigDecimal.valueOf(unpaidMinutes);
        BigDecimal denom = BigDecimal.valueOf(workMinutesPerMonth);

        BigDecimal deduction = base.multiply(unpaid).divide(denom, 0, RoundingMode.HALF_UP);
        BigDecimal result = base.subtract(deduction);
        if (result.signum() < 0) return 0;
        return result.intValueExact();
    }

    private int calcOvertimeAmount(
            int baseSalary,
            int workMinutesPerMonth,
            BigDecimal rateMultiplier,
            int overtimeMinutes
    ) {
        if (baseSalary <= 0 || overtimeMinutes <= 0) return 0;

        BigDecimal base = BigDecimal.valueOf(baseSalary);
        BigDecimal perMinute = base.divide(BigDecimal.valueOf(workMinutesPerMonth), 10, RoundingMode.HALF_UP);
        BigDecimal ov = perMinute
                .multiply(BigDecimal.valueOf(overtimeMinutes))
                .multiply(rateMultiplier);

        return ov.setScale(0, RoundingMode.HALF_UP).intValueExact();
    }

    private int safe(Integer v) {
        return v == null ? 0 : v;
    }

    private static class MonthRange {
        final LocalDate start;
        final LocalDate end;

        private MonthRange(LocalDate start, LocalDate end) {
            this.start = start;
            this.end = end;
        }

        static MonthRange of(LocalDate payMonth) {
            LocalDate start = payMonth.withDayOfMonth(1);
            LocalDate end = payMonth.withDayOfMonth(payMonth.lengthOfMonth());
            return new MonthRange(start, end);
        }
    }
}
