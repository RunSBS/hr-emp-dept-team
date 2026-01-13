package boot.team.hr.hyun.outsourcing.controller;

import boot.team.hr.hyun.outsourcing.dto.OutsourcingAssignmentDto;
import boot.team.hr.hyun.outsourcing.dto.OutsourcingCompanyDto;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/hyun/outsourcing")
public class OutsourcingController {
    // 파견 업체 컨트롤러
    public List<OutsourcingCompanyDto> selectAll(){
        return null;
    }
    public void insertOutsourcingCompany(){

    }
    public void updateOutsourcingCompany(){

    }
    public void deleteOutsourcingCompany(){
    }

    // 파견 배치 컨트롤러
    public List<OutsourcingAssignmentDto> selectAllAssignment(){
        return null;
    }
    public void insertOutsourcingAssignment(){

    }
    public void updateOutsourcingAssignment(){

    }
    public void deleteOutsourcingAssignment(){

    }
}
