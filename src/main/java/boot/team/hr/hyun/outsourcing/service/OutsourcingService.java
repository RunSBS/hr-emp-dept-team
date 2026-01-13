package boot.team.hr.hyun.outsourcing.service;

import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.hyun.outsourcing.dto.OutsourcingAssignmentDto;
import boot.team.hr.hyun.outsourcing.dto.OutsourcingCompanyDto;
import boot.team.hr.hyun.outsourcing.repo.OutsourcingAssignmentRepository;
import boot.team.hr.hyun.outsourcing.repo.OutsourcingCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OutsourcingService {
    private final OutsourcingCompanyRepository outsourcingCompanyRepository;
    private final OutsourcingAssignmentRepository outsourcingAssignmentRepository;
    private final EmpRepository empRepository;

    public List<OutsourcingCompanyDto> selectAll(){
        return null;
    }
    public void insertOutsourcingCompany(){

    }
    public void updateOutsourcingCompany(){

    }
    public void deleteOutsourcingCompany(){

    }

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
