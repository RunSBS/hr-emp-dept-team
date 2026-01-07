package boot.team.hr.hyun.service;

import boot.team.hr.hyun.dto.EmpDto;
import boot.team.hr.hyun.entity.Emp;
import boot.team.hr.hyun.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpService {
    private final EmpRepository empRepository;

    public List<EmpDto> selectAll() {
        List<Emp> emps = empRepository.findAll();
        List<EmpDto> dtos = new ArrayList<>();

        for (Emp emp : emps) {
            EmpDto dto = new EmpDto();
            // emp(엔티티)에서 꺼내서 dto에 담습니다.
            dto.setEmpId(String.valueOf(emp.getEmpId()));
            dto.setEmpName(emp.getEmpName());
            dto.setDeptId(String.valueOf(emp.getDeptId()));
            dto.setEmail(emp.getEmail());
            dto.setRole(emp.getRole());

            // 날짜 변환 (null 체크 추가)
            if (emp.getCreatedAt() != null) {
                dto.setCreatedAt(emp.getCreatedAt().toString());
            }
            if (emp.getUpdatedAt() != null) {
                dto.setUpdatedAt(emp.getUpdatedAt().toString());
            }

            dtos.add(dto);
        }
        return dtos;
    }

    public void insertEmp(EmpDto empDto) {
        Emp emp = new Emp();
        // dto에서 꺼내서 emp(엔티티)에 담습니다.
        // String -> Integer 변환 시 발생할 수 있는 null 에러를 방지하려면 체크가 필요할 수 있습니다.
        emp.setEmpId(Integer.valueOf(empDto.getEmpId()));
        emp.setEmpName(empDto.getEmpName());
        emp.setDeptId(Integer.valueOf(empDto.getDeptId()));
        emp.setEmail(empDto.getEmail());
        emp.setRole(empDto.getRole());

        // 생성 시간 및 수정 시간 설정
        emp.setCreatedAt(LocalDateTime.now());
        emp.setUpdatedAt(LocalDateTime.now());

        empRepository.save(emp);
    }

}