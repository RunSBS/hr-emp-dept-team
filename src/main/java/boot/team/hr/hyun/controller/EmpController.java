package boot.team.hr.hyun.controller;

import boot.team.hr.hyun.dto.EmpDto;
import boot.team.hr.hyun.service.EmpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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
}
