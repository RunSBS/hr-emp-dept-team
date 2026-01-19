package boot.team.hr.hyun.dept.controller;

import boot.team.hr.hyun.dept.dto.DeptDto;
import boot.team.hr.hyun.dept.dto.DeptHistoryDto;
import boot.team.hr.hyun.dept.service.DeptService;
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
    public void insertDept(@RequestBody DeptDto deptDto){
        deptService.insertDept(deptDto);
    }
    @PutMapping("/update")
    public void updateDept(@RequestBody DeptDto deptDto){
        // 세션 혹은 시큐리티 컨텍스트에서 로그인한 사용자 ID 추출 (예시)
        // String tempLoginEmpId = SecurityContextHolder.getContext().getAuthentication().getName();
        String tempLoginEmpId = "admin1"; // 아직 로그인 기능 연동 전이라면 임시로 고정값 사용
        deptService.updateDept(deptDto,tempLoginEmpId);
    }
    @DeleteMapping("/delete/{deptNo}")
    public void deleteDeptById(@PathVariable Integer deptNo){
        deptService.deleteDept(deptNo);
    }

    // 부서번호로 조회하여 해당 부서의 변경이력을 반환
    @GetMapping("/selectHistory")
    public List<DeptHistoryDto> deptHistory(@RequestParam Integer deptNo){
        return deptService.selectAllDeptHistoryDto(deptNo);
    }

}
