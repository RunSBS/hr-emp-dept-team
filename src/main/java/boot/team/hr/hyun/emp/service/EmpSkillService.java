package boot.team.hr.hyun.emp.service;

import boot.team.hr.hyun.emp.dto.EmpSkillDto;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.entity.EmpSkill;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.hyun.emp.repo.EmpSkillRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EmpSkillService {
    private final EmpRepository empRepository;
    private final EmpSkillRepository empSkillRepository;

    /*
     * 사원 기술스택 메서드들
     * */
    public void insertEmpSkill(EmpSkillDto empSkillDto){
        Emp emp = empRepository.findById(empSkillDto.getEmpId())
                .orElseThrow(()-> new RuntimeException("해당 사원이 없습니다."));
        EmpSkill empSkill = EmpSkill.builder()
                .empId(emp)
                .skillName(empSkillDto.getSkillName())
                .years(empSkillDto.getYears())
                .skillLevel(empSkillDto.getSkillLevel())
                .build();
        empSkillRepository.save(empSkill);
    }
    public void updateEmpSkill(EmpSkillDto empSkillDto){
        Emp emp = empRepository.findById(empSkillDto.getEmpId())
                .orElseThrow(()-> new RuntimeException("해당 사원이 없습니다."));
        EmpSkill empSkill = empSkillRepository.findByEmpIdAndSkillName(empSkillDto.getEmpId(), empSkillDto.getSkillName())
                .orElseThrow(()-> new RuntimeException("해당 기술스택이 없습니다."));

        empSkill.update(empSkillDto.getSkillName(), empSkillDto.getYears(), empSkillDto.getSkillLevel());
    }
    public void deleteEmpSkill(EmpSkillDto empSkillDto){
        Emp emp = empRepository.findById(empSkillDto.getEmpId())
                .orElseThrow(()-> new RuntimeException("해당 사원이 없습니다."));
        empSkillRepository.deleteByEmpId_EmpIdAndSkillName(empSkillDto.getEmpId(),empSkillDto.getSkillName());
    }

    public List<EmpSkillDto> selectEmpSkill(){
        List<EmpSkill> empSkills = empSkillRepository.findAll();
        List<EmpSkillDto> dtos = new ArrayList<>();
        for(EmpSkill empSkill : empSkills){
            EmpSkillDto dto = EmpSkillDto.builder()
                    .empId(empSkill.getEmpId().getEmpId())
                    .skillName(empSkill.getSkillName())
                    .years(empSkill.getYears())
                    .skillLevel(empSkill.getSkillLevel())
                    .build();
            dtos.add(dto);
        }
        return dtos;
    }
    public List<EmpSkillDto> getSkillsByEmpId(String empId) {
        // 1. 리포지토리에서 해당 사번의 데이터만 가져옴
        List<EmpSkill> empSkills = empSkillRepository.findByEmpId_EmpId(empId);

        // 2. DTO 리스트로 변환
        List<EmpSkillDto> dtos = new ArrayList<>();
        for (EmpSkill skill : empSkills) {
            dtos.add(EmpSkillDto.builder()
                    .empId(skill.getEmpId().getEmpId())
                    .skillName(skill.getSkillName())
                    .years(skill.getYears())
                    .skillLevel(skill.getSkillLevel())
                    .build());
        }
        return dtos;
    }
}
