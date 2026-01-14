package boot.team.hr.hyun.outsourcing.controller;

import boot.team.hr.hyun.outsourcing.dto.OutsourcingAssignmentDto;
import boot.team.hr.hyun.outsourcing.dto.OutsourcingCompanyDto;
import boot.team.hr.hyun.outsourcing.service.OutsourcingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hyun/outsourcing")
@RequiredArgsConstructor
public class OutsourcingController {
    private final OutsourcingService outsourcingService;
    // 파견 업체 컨트롤러
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
        outsourcingService.updateOutsourcingCompany(outsourcingCompanyDto);
    }
    @DeleteMapping("/deleteCompany")
    public void deleteOutsourcingCompany(@RequestBody OutsourcingCompanyDto outsourcingCompanyDto){
        outsourcingService.deleteOutsourcingCompany(outsourcingCompanyDto.getCompanyName());
    }

    // 파견 배치 컨트롤러
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
        outsourcingService.updateOutsourcingAssignment(outsourcingAssignmentDto);
    }
    @DeleteMapping("/deleteAssignment")
    public void deleteOutsourcingAssignment(@RequestBody OutsourcingAssignmentDto outsourcingAssignmentDto){
        outsourcingService.deleteOutsourcingAssignment(outsourcingAssignmentDto.getAssignmentId());
    }
}
