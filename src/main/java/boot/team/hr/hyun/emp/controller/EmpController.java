package boot.team.hr.hyun.emp.controller;

import boot.team.hr.hyun.emp.dto.EmpDto;
import boot.team.hr.hyun.emp.dto.EmpHistoryDto;
import boot.team.hr.hyun.emp.service.EmpService;
import boot.team.hr.min.account.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public void updateEmp(@RequestBody EmpDto empDto, @AuthenticationPrincipal CustomUserDetails user){

        if (user == null) {
            // 이 에러가 발생한다면 프론트에서 로그인이 풀렸거나 시큐리티 설정 문제임
            throw new RuntimeException("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        String loggedEmpId = user.getEmpId();

        // 만약 ADMIN이라서 getEmpId()가 null인 경우를 위한 처리
        if (loggedEmpId == null) {
            loggedEmpId = "ADMIN_SYSTEM"; // 관리자 계정용 고유 ID 혹은 예외 처리
        }
        empService.updateEmp(empDto, loggedEmpId);
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
