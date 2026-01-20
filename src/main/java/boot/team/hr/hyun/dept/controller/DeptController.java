package boot.team.hr.hyun.dept.controller;

import boot.team.hr.hyun.dept.dto.DeptDto;
import boot.team.hr.hyun.dept.dto.DeptHistoryDto;
import boot.team.hr.hyun.dept.service.DeptService;
import boot.team.hr.min.account.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public void updateDept(@RequestBody DeptDto deptDto, @AuthenticationPrincipal CustomUserDetails user){
        // 세션 혹은 시큐리티 컨텍스트에서 로그인한 사용자 ID 추출 (예시)
        // String tempLoginEmpId = SecurityContextHolder.getContext().getAuthentication().getName();

        if (user == null) {
            // 이 에러가 발생한다면 프론트에서 로그인이 풀렸거나 시큐리티 설정 문제임
            throw new RuntimeException("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
        }

        String loggedEmpId = user.getEmpId();

        // 만약 ADMIN이라서 getEmpId()가 null인 경우를 위한 처리
        if (loggedEmpId == null) {
            loggedEmpId = "ADMIN_SYSTEM"; // 관리자 계정용 고유 ID 혹은 예외 처리
        }

        deptService.updateDept(deptDto,loggedEmpId);
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
