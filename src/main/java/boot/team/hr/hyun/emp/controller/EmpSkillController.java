package boot.team.hr.hyun.emp.controller;

import boot.team.hr.hyun.emp.dto.EmpSkillDto;
import boot.team.hr.hyun.emp.service.EmpSkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/hyun/empSkill")
public class EmpSkillController {
    private final EmpSkillService empSkillService;

    @PostMapping("/insert")
    public void insertSkill(@RequestBody EmpSkillDto empSkillDto){
        empSkillService.insertEmpSkill(empSkillDto);
    }
    @GetMapping("/select")
    public List<EmpSkillDto> selectSkill(String email){
        return empSkillService.selectEmpSkill();
    }
    @GetMapping("/list")
    public List<EmpSkillDto> getSkillsByEmpId(@RequestParam("empId") String empId) {
        return empSkillService.getSkillsByEmpId(empId);
    }
    @PutMapping("/update")
    public void updateSkill(@RequestBody EmpSkillDto empSkillDto){
        empSkillService.updateEmpSkill(empSkillDto);
    }
    @DeleteMapping("/delete")
    public void deleteSkill(@RequestBody EmpSkillDto empSkillDto){
        empSkillService.deleteEmpSkill(empSkillDto);
    }
}
