package boot.team.hr.hyun.dept.controller;

import boot.team.hr.hyun.dept.dto.DeptDto;
import boot.team.hr.hyun.dept.service.DeptService;
import boot.team.hr.hyun.emp.dto.EmpDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hyun/dept")
@RequiredArgsConstructor
public class DeptController {
    private final DeptService deptService;

    @GetMapping("/selectAll")
    public List<DeptDto> selectAll(){
        return deptService.selectAll();
    }
    @PostMapping("/insert")
    public void insertEmp(@RequestBody DeptDto deptDto){
        deptService.insertDept(deptDto);
    }
    @PutMapping("/update")
    public void updateEmp(@RequestBody DeptDto deptDto){
        deptService.updateDept(deptDto);
    }
    @DeleteMapping("/delete")
    public void deleteEmpById(@RequestBody DeptDto deptDto){
        deptService.deleteDept(Integer.valueOf(deptDto.getDeptId()));
    }


}
