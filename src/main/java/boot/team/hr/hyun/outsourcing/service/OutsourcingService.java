package boot.team.hr.hyun.outsourcing.service;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.hyun.outsourcing.dto.OutsourcingAssignmentDto;
import boot.team.hr.hyun.outsourcing.dto.OutsourcingCompanyDto;
import boot.team.hr.hyun.outsourcing.entity.OutsourcingAssignment;
import boot.team.hr.hyun.outsourcing.entity.OutsourcingCompany;
import boot.team.hr.hyun.outsourcing.repo.OutsourcingAssignmentRepository;
import boot.team.hr.hyun.outsourcing.repo.OutsourcingCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OutsourcingService {
    private final OutsourcingCompanyRepository outsourcingCompanyRepository;
    private final OutsourcingAssignmentRepository outsourcingAssignmentRepository;
    private final EmpRepository empRepository;

    public List<OutsourcingCompanyDto> selectAllOutsourcingCompany(){
        List<OutsourcingCompany> outsourcingCompanies = outsourcingCompanyRepository.findAll();
        List<OutsourcingCompanyDto> outsourcingCompanyDtos = new ArrayList<>();
        for(OutsourcingCompany outsourcingCompany : outsourcingCompanies){
            OutsourcingCompanyDto outsourcingCompanyDto = new OutsourcingCompanyDto();
            outsourcingCompanyDto.setCompanyId(outsourcingCompany.getCompanyId());
            outsourcingCompanyDto.setCompanyName(outsourcingCompany.getCompanyName());
            outsourcingCompanyDto.setCreatedAt(outsourcingCompany.getCreatedAt());
            outsourcingCompanyDto.setUpdatedAt(outsourcingCompany.getUpdatedAt());
            outsourcingCompanyDtos.add(outsourcingCompanyDto);
        }
        return outsourcingCompanyDtos;
    }
    public void insertOutsourcingCompany(OutsourcingCompanyDto outsourcingCompanyDto){
        OutsourcingCompany outsourcingCompany = new OutsourcingCompany();
        outsourcingCompany.setCompanyName(outsourcingCompanyDto.getCompanyName());
        outsourcingCompanyRepository.save(outsourcingCompany);
    }
    @Transactional
    public void updateOutsourcingCompany(OutsourcingCompanyDto outsourcingCompanyDto){
        OutsourcingCompany outsourcingCompany = outsourcingCompanyRepository.findByCompanyName(outsourcingCompanyDto.getCompanyName())
                .orElseThrow(()->new RuntimeException("해당하는 파견업체가 없습니다."));
        outsourcingCompany.setCompanyName(outsourcingCompanyDto.getCompanyName());
    }
    @Transactional
    public void deleteOutsourcingCompany(String companyName){
        outsourcingCompanyRepository.deleteByCompanyName(companyName);
    }

    public List<OutsourcingAssignmentDto> selectAllOutsourcingAssignment(){
        List<OutsourcingAssignment> outsourcingAssignments = outsourcingAssignmentRepository.findAll();
        List<OutsourcingAssignmentDto> outsourcingAssignmentDtos = new ArrayList<>();
        for(OutsourcingAssignment outsourcingAssignment : outsourcingAssignments){
            OutsourcingAssignmentDto outsourcingAssignmentDto = new OutsourcingAssignmentDto();
            outsourcingAssignmentDto.setEmpId(outsourcingAssignment.getEmp().getEmpId());
            outsourcingAssignmentDto.setCompanyId(outsourcingAssignment.getCompany().getCompanyId());
            outsourcingAssignmentDto.setAssignmentId(outsourcingAssignment.getAssignmentId());
            outsourcingAssignmentDto.setProjectName(outsourcingAssignment.getProjectName());
            outsourcingAssignmentDto.setStatus(outsourcingAssignment.getStatus());
            outsourcingAssignmentDto.setStartDate(outsourcingAssignment.getStartDate());
            outsourcingAssignmentDto.setEndDate(outsourcingAssignment.getEndDate());
            outsourcingAssignmentDtos.add(outsourcingAssignmentDto);
        }
        return outsourcingAssignmentDtos;
    }
    public void insertOutsourcingAssignment(OutsourcingAssignmentDto outsourcingAssignmentDto){
        OutsourcingAssignment outsourcingAssignment = new OutsourcingAssignment();
        outsourcingAssignment.setAssignmentId(outsourcingAssignmentDto.getAssignmentId());
        if(outsourcingAssignmentDto.getEmpId() != null){
            Emp emp = empRepository.findById(outsourcingAssignmentDto.getEmpId())
                    .orElseThrow(()->new RuntimeException("해당 사원이 없습니다."));
            outsourcingAssignment.setEmp(emp);
        }
        if(outsourcingAssignmentDto.getCompanyId() != null){
            OutsourcingCompany outsourcingCompany = outsourcingCompanyRepository.findById(outsourcingAssignmentDto.getCompanyId())
                    .orElseThrow(()->new RuntimeException("해당 업체가 없습니다."));
            outsourcingAssignment.setCompany(outsourcingCompany);
        }
        outsourcingAssignment.setProjectName(outsourcingAssignmentDto.getProjectName());
        outsourcingAssignment.setStatus(outsourcingAssignmentDto.getStatus());
        outsourcingAssignment.setStartDate(outsourcingAssignmentDto.getStartDate());
        outsourcingAssignment.setEndDate(outsourcingAssignmentDto.getEndDate());
        outsourcingAssignmentRepository.save(outsourcingAssignment);
    }
    @Transactional
    public void updateOutsourcingAssignment(OutsourcingAssignmentDto outsourcingAssignmentDto){
        OutsourcingAssignment outsourcingAssignment = outsourcingAssignmentRepository.findById(outsourcingAssignmentDto.getAssignmentId())
                .orElseThrow(()->new RuntimeException("해당하는 파견 배치정보가 없습니다."));
        outsourcingAssignment.setProjectName(outsourcingAssignmentDto.getProjectName());
        outsourcingAssignment.setStatus(outsourcingAssignmentDto.getStatus());
        outsourcingAssignment.setStartDate(outsourcingAssignmentDto.getStartDate());
        outsourcingAssignment.setEndDate(outsourcingAssignmentDto.getEndDate());
    }
    public void deleteOutsourcingAssignment(Long assignmentId){
        outsourcingAssignmentRepository.deleteById(assignmentId);
    }
}
