package boot.team.hr.hyun.emp.service;

import boot.team.hr.hyun.dept.dto.DeptHistoryDto;
import boot.team.hr.hyun.dept.entity.Dept;
import boot.team.hr.hyun.dept.repo.DeptRepository;
import boot.team.hr.hyun.emp.dto.EmpDto;
import boot.team.hr.hyun.emp.dto.EmpHistoryDto;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.entity.EmpHistory;
import boot.team.hr.hyun.emp.repo.EmpHistoryRepository;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpService {
    private final EmpRepository empRepository;
    private final DeptRepository deptRepository;
    private final EmpHistoryRepository empHistoryRepository;

    @Transactional(readOnly = true)
    public List<EmpDto> selectAll() {
        List<Emp> emps = empRepository.findAll();
        List<EmpDto> dtos = new ArrayList<>();

        // 익숙한 for문 방식으로 작성했습니다.
        for (Emp emp : emps) {
                EmpDto dto = EmpDto.builder()
                        .empId(emp.getEmpId())
                        .empName(emp.getEmpName())
                        .email(emp.getEmail())
                        .empRole(emp.getEmpRole())
                        .hireDate(emp.getHireDate())
                        // 부서가 아직 없어도 null로 표시
                        .deptNo(emp.getDept() != null ? emp.getDept().getDeptNo() : null)
                        .createdAt(emp.getCreatedAt())
                        .updatedAt(emp.getUpdatedAt())
                        .build();
                dtos.add(dto);

        }
        return dtos;
    }

    public void insertEmp(EmpDto empDto) {
        Dept dept = deptRepository.findById(empDto.getDeptNo())
                .orElseThrow(() -> new RuntimeException("해당 부서가 없습니다."));

        Emp emp = Emp.builder()
                .empId(empDto.getEmpId())
                .empName(empDto.getEmpName())
                .email(empDto.getEmail())
                .empRole(empDto.getEmpRole())
                .hireDate(empDto.getHireDate())
                .dept(dept)
                .build();
        empRepository.save(emp);
    }

    @Transactional
    public void updateEmp(EmpDto empDto, String loggedEmpId) {
        Emp emp = empRepository.findById(empDto.getEmpId())
                .orElseThrow(() -> new RuntimeException("해당 사원 없음"));
        Dept dept = deptRepository.findById(empDto.getDeptNo())
                    .orElseThrow(() -> new RuntimeException("부서 번호가 올바르지 않습니다."));
        // 사번은 기본키이므로 변경하지 않도록 함.
        // @Builder는 객체를 "생성"하기에 수정작업에는 사용하지 않는다.


        // 사원의 정보를 수정한 관리자(사원)
        Emp changer = empRepository.findById(loggedEmpId)
                .orElseThrow(() -> new RuntimeException("변경자 정보가 없습니다."));
        // 변경 이력을 저장할 배열
        List<EmpHistory> histories = new ArrayList<>();

        // 사원명을 변경한 경우
        if(!emp.getEmpName().equals(empDto.getEmpName())){
            histories.add(createHistory(empDto.getEmpId(), "empName", emp.getEmpName(), empDto.getEmpName(), changer));
        }
        // 사원이 속한 부서(부서번호)를 변경한 경우
        if(!emp.getDept().getDeptNo().equals(empDto.getDeptNo())){
            histories.add(createHistory(empDto.getEmpId(), "deptNo", emp.getDept().getDeptNo().toString(), empDto.getDeptNo().toString(), changer));
        }
        // 이메일을 변경한 경우
        if(!emp.getEmail().equals(empDto.getEmail())){
            histories.add(createHistory(empDto.getEmpId(), "email", emp.getEmail(), empDto.getEmail(), changer));
        }
        // 입사일을 변경한 경우
        if(!emp.getHireDate().equals(empDto.getHireDate())){
            histories.add(createHistory(empDto.getEmpId(), "hireDate", emp.getHireDate().toString(), empDto.getHireDate().toString(), changer));
        }
        // 직급을 변경한 경우
        if(!emp.getEmpRole().equals(empDto.getEmpRole())){
            histories.add(createHistory(empDto.getEmpId(), "empRole", emp.getEmpRole(), empDto.getEmpRole(), changer));
        }

        // 변경이 있다면, DB에 한번에 저장
        if(!histories.isEmpty()){
            empHistoryRepository.saveAll(histories);
        }


        emp.update(empDto.getEmpName(), empDto.getEmail(), empDto.getEmpRole(), empDto.getHireDate(), dept);
    }
    private EmpHistory createHistory(String empId, String fieldName, String beforeValue, String afterValue, Emp changer){
        return EmpHistory.builder()
                .empId(empId)
                .changeType("UPDATE")
                .fieldName(fieldName)
                .beforeValue(beforeValue)
                .afterValue(afterValue)
                .changer(changer)
                .build();
    }

    public void deleteEmp(String empId) {
        empRepository.deleteById(empId);
    }

    public List<EmpDto> selectEmpByDeptNo(Integer deptno){
        List<Emp> emps = empRepository.findByDept_DeptNo(deptno);
        List<EmpDto> dtos = new ArrayList<>();
        for(Emp emp : emps){
            EmpDto dto = EmpDto.builder()
                    .empId(emp.getEmpId())
                    .empName(emp.getEmpName())
                    .email(emp.getEmail())
                    .empRole(emp.getEmpRole())
                    .hireDate(emp.getHireDate())
                    .deptNo(emp.getDept().getDeptNo())
                    .createdAt(emp.getCreatedAt())
                    .updatedAt(emp.getUpdatedAt())
                    .build();
            dtos.add(dto);
        }
        return dtos;
    }

    // 사원번호로 검색해서, 해당 사원의 변경 이력을 조회한다.
    public List<EmpHistoryDto> selectAllEmpHistoryDto(String empId){
        List<EmpHistory> histories = empHistoryRepository.findByEmpIdOrderByCreatedAtDesc(empId);
        List<EmpHistoryDto> dtos = new ArrayList<>();

        for(EmpHistory history : histories){
            EmpHistoryDto dto = EmpHistoryDto.builder()
                    .empHistoryId(history.getEmpHistoryId())
                    .empId(history.getEmpId())
                    .changeType(history.getChangeType())
                    .fieldName(history.getFieldName())
                    .changerName(history.getChanger().getEmpName())
                    .beforeValue(history.getBeforeValue())
                    .afterValue(history.getAfterValue())
                    .createdAt(history.getCreatedAt())
                    .build();
            dtos.add(dto);
        }
        return dtos;
    }
}