package boot.team.hr.hyun.outsourcing.service;

import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import boot.team.hr.hyun.outsourcing.dto.*;
import boot.team.hr.hyun.outsourcing.entity.*;
import boot.team.hr.hyun.outsourcing.repo.*;
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

    // 이력 리포지토리 추가
    private final OutsourcingCompanyHistoryRepository companyHistoryRepository;
    private final OutsourcingAssignmentHistoryRepository assignmentHistoryRepository;

    public List<OutsourcingCompanyDto> selectAllOutsourcingCompany(){
        List<OutsourcingCompany> outsourcingCompanies = outsourcingCompanyRepository.findAll();
        List<OutsourcingCompanyDto> outsourcingCompanyDtos = new ArrayList<>();
        for(OutsourcingCompany outsourcingCompany : outsourcingCompanies){
            OutsourcingCompanyDto outsourcingCompanyDto = OutsourcingCompanyDto.builder()
                    .companyId(outsourcingCompany.getCompanyId())
                    .companyName(outsourcingCompany.getCompanyName())
                    .createdAt(outsourcingCompany.getCreatedAt())
                    .updatedAt(outsourcingCompany.getUpdatedAt())
                    .build();
            outsourcingCompanyDtos.add(outsourcingCompanyDto);
        }
        return outsourcingCompanyDtos;
    }

    public void insertOutsourcingCompany(OutsourcingCompanyDto outsourcingCompanyDto){
        OutsourcingCompany outsourcingCompany = OutsourcingCompany.builder()
                .companyName(outsourcingCompanyDto.getCompanyName())
                .build();
        outsourcingCompanyRepository.save(outsourcingCompany);
    }

    // [수정된 부분] 업체 수정 시 이력 저장 스타일 적용
    @Transactional
    public void updateOutsourcingCompany(OutsourcingCompanyDto dto, String loggedEmpId){
        OutsourcingCompany company = outsourcingCompanyRepository.findById(dto.getCompanyId())
                .orElseThrow(()->new RuntimeException("해당하는 파견업체가 없습니다."));
        Emp changer = empRepository.findById(loggedEmpId)
                .orElseThrow(() -> new RuntimeException("변경자 정보가 없습니다."));

        List<OutsourcingCompanyHistory> histories = new ArrayList<>();

        // 업체명 변경 체크
        if(!company.getCompanyName().equals(dto.getCompanyName())){
            histories.add(createCompanyHistory(dto.getCompanyId(), "companyName", company.getCompanyName(), dto.getCompanyName(), changer));
        }

        if(!histories.isEmpty()){
            companyHistoryRepository.saveAll(histories);
        }

        company.update(dto.getCompanyName());
    }

    @Transactional
    public void deleteOutsourcingCompany(String companyName){
        outsourcingCompanyRepository.deleteByCompanyName(companyName);
    }

    public List<OutsourcingAssignmentDto> selectAllOutsourcingAssignment(){
        List<OutsourcingAssignment> outsourcingAssignments = outsourcingAssignmentRepository.findAll();
        List<OutsourcingAssignmentDto> outsourcingAssignmentDtos = new ArrayList<>();
        for(OutsourcingAssignment outsourcingAssignment : outsourcingAssignments){
            OutsourcingAssignmentDto outsourcingAssignmentDto = OutsourcingAssignmentDto.builder()
                    .assignmentId(outsourcingAssignment.getAssignmentId())
                    .empId(outsourcingAssignment.getEmp().getEmpId())
                    .companyId(outsourcingAssignment.getCompany().getCompanyId())
                    .projectName(outsourcingAssignment.getProjectName())
                    .status(outsourcingAssignment.getStatus())
                    .startDate(outsourcingAssignment.getStartDate())
                    .endDate(outsourcingAssignment.getEndDate())
                    .build();
            outsourcingAssignmentDtos.add(outsourcingAssignmentDto);
        }
        return outsourcingAssignmentDtos;
    }

    public void insertOutsourcingAssignment(OutsourcingAssignmentDto outsourcingAssignmentDto){
        Emp emp = empRepository.findById(outsourcingAssignmentDto.getEmpId())
                .orElseThrow(()->new RuntimeException("해당 사원이 없습니다."));
        OutsourcingCompany outsourcingCompany = outsourcingCompanyRepository.findById(outsourcingAssignmentDto.getCompanyId())
                .orElseThrow(()->new RuntimeException("해당 업체가 없습니다."));

        OutsourcingAssignment outsourcingAssignment = OutsourcingAssignment.builder()
                .emp(emp)
                .company(outsourcingCompany)
                .projectName(outsourcingAssignmentDto.getProjectName())
                .status(outsourcingAssignmentDto.getStatus())
                .startDate(outsourcingAssignmentDto.getStartDate())
                .endDate(outsourcingAssignmentDto.getEndDate())
                .build();

        outsourcingAssignmentRepository.save(outsourcingAssignment);
    }

    // [수정된 부분] 배치 정보 수정 시 이력 저장 스타일 적용
    @Transactional
    public void updateOutsourcingAssignment(OutsourcingAssignmentDto dto, String loggedEmpId){
        OutsourcingAssignment assign = outsourcingAssignmentRepository.findById(dto.getAssignmentId())
                .orElseThrow(()->new RuntimeException("해당하는 파견 배치정보가 없습니다."));
        Emp changer = empRepository.findById(loggedEmpId)
                .orElseThrow(() -> new RuntimeException("변경자 정보가 없습니다."));

        List<OutsourcingAssignmentHistory> histories = new ArrayList<>();

        // 1. 업체 변경 체크
        if(!assign.getCompany().getCompanyId().equals(dto.getCompanyId())){
            histories.add(createAssignHistory(dto.getAssignmentId(), "companyId", assign.getCompany().getCompanyId().toString(), dto.getCompanyId().toString(), changer));
        }
        // 2. 프로젝트명 변경 체크
        if(!assign.getProjectName().equals(dto.getProjectName())){
            histories.add(createAssignHistory(dto.getAssignmentId(), "projectName", assign.getProjectName(), dto.getProjectName(), changer));
        }
        // 3. 상태 변경 체크
        if(!assign.getStatus().equals(dto.getStatus())){
            histories.add(createAssignHistory(dto.getAssignmentId(), "status", assign.getStatus(), dto.getStatus(), changer));
        }
        // 4. 날짜 변경 체크
        if(!assign.getStartDate().equals(dto.getStartDate())){
            histories.add(createAssignHistory(dto.getAssignmentId(), "startDate", assign.getStartDate().toString(), dto.getStartDate().toString(), changer));
        }
        String oldEnd = assign.getEndDate() != null ? assign.getEndDate().toString() : "";
        String newEnd = dto.getEndDate() != null ? dto.getEndDate().toString() : "";
        if(!oldEnd.equals(newEnd)){
            histories.add(createAssignHistory(dto.getAssignmentId(), "endDate", oldEnd, newEnd, changer));
        }

        if(!histories.isEmpty()){
            assignmentHistoryRepository.saveAll(histories);
        }

        Emp emp = empRepository.findById(dto.getEmpId())
                .orElseThrow(()-> new RuntimeException("해당 사원 없음"));
        OutsourcingCompany comp = outsourcingCompanyRepository.findById(dto.getCompanyId())
                .orElseThrow(()->new RuntimeException("해당 업체 없음"));

        assign.update(emp, comp, dto.getProjectName(), dto.getStatus(), dto.getStartDate(), dto.getEndDate());
    }

    public void deleteOutsourcingAssignment(Long assignmentId){
        outsourcingAssignmentRepository.deleteById(assignmentId);
    }

    // --- 이력 조회 메서드 (Controller에서 사용) ---
    public List<OutsourcingCompanyHistoryDto> selectAllCompanyHistory(Long companyId) {
        List<OutsourcingCompanyHistory> list = companyHistoryRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
        List<OutsourcingCompanyHistoryDto> dtos = new ArrayList<>();
        for (OutsourcingCompanyHistory h : list) {
            dtos.add(OutsourcingCompanyHistoryDto.builder()
                    .companyHistoryId(h.getCompanyHistoryId())
                    .companyId(h.getCompanyId())
                    .fieldName(h.getFieldName())
                    .beforeValue(h.getBeforeValue())
                    .afterValue(h.getAfterValue())
                    .changerName(h.getChanger().getEmpName())
                    .createdAt(h.getCreatedAt())
                    .build());
        }
        return dtos;
    }

    public List<OutsourcingAssignmentHistoryDto> selectAllAssignmentHistory(Long assignmentId) {
        List<OutsourcingAssignmentHistory> list = assignmentHistoryRepository.findByAssignmentIdOrderByCreatedAtDesc(assignmentId);
        List<OutsourcingAssignmentHistoryDto> dtos = new ArrayList<>();
        for (OutsourcingAssignmentHistory h : list) {
            dtos.add(OutsourcingAssignmentHistoryDto.builder()
                    .assignHistoryId(h.getAssignHistoryId())
                    .assignmentId(h.getAssignmentId())
                    .fieldName(h.getFieldName())
                    .beforeValue(h.getBeforeValue())
                    .afterValue(h.getAfterValue())
                    .changerName(h.getChanger().getEmpName())
                    .createdAt(h.getCreatedAt())
                    .build());
        }
        return dtos;
    }

    // --- 헬퍼 메서드 ---
    private OutsourcingCompanyHistory createCompanyHistory(Long id, String field, String before, String after, Emp changer) {
        return OutsourcingCompanyHistory.builder()
                .companyId(id)
                .fieldName(field)
                .beforeValue(before)
                .afterValue(after)
                .changer(changer)
                .build();
    }
    private OutsourcingAssignmentHistory createAssignHistory(Long id, String field, String before, String after, Emp changer) {
        return OutsourcingAssignmentHistory.builder()
                .assignmentId(id)
                .fieldName(field)
                .beforeValue(before)
                .afterValue(after)
                .changer(changer)
                .build();
    }
}