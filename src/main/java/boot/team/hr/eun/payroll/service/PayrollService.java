package boot.team.hr.eun.payroll.service;

import boot.team.hr.eun.payroll.dto.PayrollMonthlyListItemDto;
import boot.team.hr.eun.payroll.dto.PayrollSummaryResponseDto;
import boot.team.hr.eun.payroll.dto.PayrollUpsertSalaryRequestDto;

import java.time.LocalDate;
import java.util.List;

public interface PayrollService {

    void upsertMonthlySalaryInfo(PayrollUpsertSalaryRequestDto req);

    void closeMonthlyPayroll(LocalDate payMonth);

    PayrollSummaryResponseDto getPayrollSummary(String empId, LocalDate payMonth);

    List<PayrollMonthlyListItemDto> getMonthlyPayrollList(LocalDate payMonth);
}
