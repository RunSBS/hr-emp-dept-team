package boot.team.hr.hyun.outsourcing.controller;

import boot.team.hr.hyun.outsourcing.dto.*;
import boot.team.hr.hyun.outsourcing.service.OutsourcingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hyun/outsourcing")
@RequiredArgsConstructor
public class OutsourcingController {
    private final OutsourcingService outsourcingService;

    // --- [파견 업체 관리] ---

    @GetMapping("/selectAllCompany")
    public List<OutsourcingCompanyDto> selectAll(){
        return outsourcingService.selectAllOutsourcingCompany();
    }

    @PostMapping("/insertCompany")
    public void insertOutsourcingCompany(@RequestBody OutsourcingCompanyDto outsourcingCompanyDto){
        outsourcingService.insertOutsourcingCompany(outsourcingCompanyDto);
    }

    @PutMapping("/updateCompany")
    public void updateOutsourcingCompany(@RequestBody OutsourcingCompanyDto outsourcingCompanyDto){
        // 실제 운영 시에는 SecurityContextHolder에서 추출
        String tempLoginEmpId = "admin1";
        outsourcingService.updateOutsourcingCompany(outsourcingCompanyDto, tempLoginEmpId);
    }

    @DeleteMapping("/deleteCompany")
    public void deleteOutsourcingCompany(@RequestBody OutsourcingCompanyDto outsourcingCompanyDto){
        outsourcingService.deleteOutsourcingCompany(outsourcingCompanyDto.getCompanyName());
    }

    // 업체별 변경 이력 조회
    @GetMapping("/selectCompanyHistory")
    public List<OutsourcingCompanyHistoryDto> getCompanyHistory(@RequestParam("companyId") Long companyId) {
        return outsourcingService.selectAllCompanyHistory(companyId);
    }


    // --- [파견 배치 관리] ---

    @GetMapping("/selectAllAssignment")
    public List<OutsourcingAssignmentDto> selectAllAssignment(){
        return outsourcingService.selectAllOutsourcingAssignment();
    }

    @PostMapping("/insertAssignment")
    public void insertOutsourcingAssignment(@RequestBody OutsourcingAssignmentDto outsourcingAssignmentDto){
        outsourcingService.insertOutsourcingAssignment(outsourcingAssignmentDto);
    }

    @PutMapping("/updateAssignment")
    public void updateOutsourcingAssignment(@RequestBody OutsourcingAssignmentDto outsourcingAssignmentDto){
        // 실제 운영 시에는 SecurityContextHolder에서 추출
        String tempLoginEmpId = "admin1";
        outsourcingService.updateOutsourcingAssignment(outsourcingAssignmentDto, tempLoginEmpId);
    }

    @DeleteMapping("/deleteAssignment/{assignmentId}")
    public void deleteOutsourcingAssignment(@PathVariable("assignmentId") Long assignmentId){
        outsourcingService.deleteOutsourcingAssignment(assignmentId);
    }

    // 프로젝트명 일괄 수정용 메서드
//    @PutMapping("/updateProjectName")
//    public void updateProjectName(@RequestBody UpdateProjectNameRequestDto requestDto) {
//        // 이 메서드는 해당 업체(companyId)의 기존 프로젝트명(oldProjectName)을
//        // 새 프로젝트명(newProjectName)으로 한꺼번에 업데이트하는 로직을 호출해야 합니다.
//        outsourcingService.updateProjectName(requestDto);
//    }

    // 배치 정보별 변경 이력 조회
    @GetMapping("/selectAssignmentHistory")
    public List<OutsourcingAssignmentHistoryDto> getAssignmentHistory(@RequestParam("assignmentId") Long assignmentId) {
        return outsourcingService.selectAllAssignmentHistory(assignmentId);
    }
}