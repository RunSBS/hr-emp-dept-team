package boot.team.hr.hyun.emp.controller;

import boot.team.hr.hyun.emp.dto.EmpDto;
import boot.team.hr.hyun.emp.dto.EmpHistoryDto;
import boot.team.hr.hyun.emp.service.EmpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/hyun/emp")
public class EmpController {
    private final EmpService empService;

    @GetMapping("/selectAll")
    public List<EmpDto> selectAll(){
        return empService.selectAll();
    }
    @PostMapping("/insert")
    @PreAuthorize("hasRole('ADMIN')")
    public void insertEmp(@RequestBody EmpDto empDto){
        empService.insertEmp(empDto);
    }
    @PutMapping("/update")
    public void updateEmp(@RequestBody EmpDto empDto){
        String tempLoginEmpId = "admin1";
        empService.updateEmp(empDto, tempLoginEmpId);
    }
    @DeleteMapping("/delete")
    public void deleteEmpById(@RequestBody EmpDto empDto){
        empService.deleteEmp(empDto.getEmpId());
    }
    @GetMapping("/selectEmpByDeptNo")
    public List<EmpDto> selectEmpByDeptNo(@RequestParam Integer deptno){
        return empService.selectEmpByDeptNo(deptno);
    }
    @GetMapping("selectHistory")
    public List<EmpHistoryDto> selectHistory(@RequestParam String empId){
        return empService.selectAllEmpHistoryDto(empId);
    }
}
