package boot.team.hr.hyun.emp.controller;

import boot.team.hr.hyun.emp.dto.EmpDto;
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
        empService.updateEmp(empDto);
    }
    @DeleteMapping("/delete")
    public void deleteEmpById(@RequestBody EmpDto empDto){
        empService.deleteEmp(empDto.getEmpId());
    }
}
