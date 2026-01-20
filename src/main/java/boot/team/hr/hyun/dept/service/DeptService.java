package boot.team.hr.hyun.dept.service;

import boot.team.hr.hyun.dept.dto.DeptDto;
import boot.team.hr.hyun.dept.dto.DeptHistoryDto;
import boot.team.hr.hyun.dept.entity.Dept;
import boot.team.hr.hyun.dept.entity.DeptHistory;
import boot.team.hr.hyun.dept.repo.DeptHistoryRepository;
import boot.team.hr.hyun.dept.repo.DeptRepository;
import boot.team.hr.hyun.emp.entity.Emp;
import boot.team.hr.hyun.emp.repo.EmpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DeptService {
    private final DeptRepository deptRepository;
    private final EmpRepository empRepository;
    private final DeptHistoryRepository deptHistoryRepository;

    public List<DeptDto> selectAll(){
        List<Dept> depts = deptRepository.findAll();
        List<DeptDto> dtos = new ArrayList<>() ;
        for(Dept dept : depts){
            DeptDto deptDto = DeptDto.builder()
                    .deptNo(dept.getDeptNo())
                    .deptName(dept.getDeptName())
                    .deptLoc(dept.getDeptLoc())
                    .parentDeptNo(dept.getParent() != null ? dept.getParent().getDeptNo() : null)
                    .treeLevel(dept.getTreeLevel())
                    .siblingOrder(dept.getSiblingOrder())
                    .createdAt(dept.getCreatedAt())
                    .updatedAt(dept.getUpdatedAt())
                    .build();
            dtos.add(deptDto);
        }
        return dtos;
    }
    public void insertDept(DeptDto deptDto){
        // 1. 부서 번호 중복 체크 추가
        if (deptRepository.existsById(deptDto.getDeptNo())) {
            throw new RuntimeException("이미 존재하는 부서 번호입니다. (" + deptDto.getDeptNo() + ")");
        }

        Dept parent = null;     // 최상위부서 ( 루트 ) 를 입력할 때 사용
        Integer treeLevel = 0;  // 마찬가지 최상위부서의 treeLevel은 0으로 세팅

        if(deptDto.getParentDeptNo() != null){
            parent = deptRepository.findById(deptDto.getParentDeptNo())
                    .orElseThrow(()-> new RuntimeException("해당 부서가 없습니다."));

            treeLevel = parent.getTreeLevel() + 1;  // 상위 부서가 있을 경우, 상위부서를 기준으로 +1
        }

        Dept dept = Dept.builder()
                .deptNo(deptDto.getDeptNo())
                .deptName(deptDto.getDeptName())
                .deptLoc(deptDto.getDeptLoc())
                .parent(parent)
                .treeLevel(treeLevel)
                .siblingOrder(deptDto.getSiblingOrder())    // 순서는 직접 설정
                .build();
        deptRepository.save(dept);
    }
    @Transactional
    public void updateDept(DeptDto deptDto, String loggedEmpId) { // String tempLoginEmpId 로직 추가해야함. 지금은 admin1 고정(1월15일)
        // 1. 기존 데이터 및 변경자 조회
        Dept dept = deptRepository.findById(deptDto.getDeptNo())
                .orElseThrow(() -> new RuntimeException("해당 부서 없음"));

        // 상위 부서 조회 (최상위 부서인 경우 처리 포함)
        Dept parent = null;
        if (deptDto.getParentDeptNo() != null) {
            parent = deptRepository.findById(deptDto.getParentDeptNo())
                    .orElseThrow(() -> new RuntimeException("해당 상위부서 없음"));
        }
        // 변경자(로그인 사원) 정보 조회
        Emp changer = empRepository.findById(loggedEmpId)
                .orElseThrow(() -> new RuntimeException("변경자 정보가 없습니다."));

        // 2. 변경 이력 감지 및 리스트 생성
        List<DeptHistory> histories = new ArrayList<>();

        // 부서명 변경 체크
        if (!dept.getDeptName().equals(deptDto.getDeptName())) {
            histories.add(createHistory(dept.getDeptNo(), "deptName", dept.getDeptName(), deptDto.getDeptName(), changer));
        }

        // 부서 위치 변경 체크
        if (!dept.getDeptLoc().equals(deptDto.getDeptLoc())) {
            histories.add(createHistory(dept.getDeptNo(), "deptLoc", dept.getDeptLoc(), deptDto.getDeptLoc(), changer));
        }

        // 상위 부서 변경 체크
        Integer oldParentNo = (dept.getParent() != null) ? dept.getParent().getDeptNo() : null;
        Integer newParentNo = (parent != null) ? parent.getDeptNo() : null;
        if (!Objects.equals(oldParentNo, newParentNo)) {
            histories.add(createHistory(dept.getDeptNo(), "parentDeptNo",
                    String.valueOf(oldParentNo), String.valueOf(newParentNo), changer));
        }

        // 3. 이력이 존재하면 일괄 저장
        if (!histories.isEmpty()) {
            deptHistoryRepository.saveAll(histories);
        }

        // 4. 실제 부서 정보 업데이트
        dept.update(
                deptDto.getDeptName(),
                deptDto.getDeptLoc(),
                parent,
                (parent != null ? parent.getTreeLevel() + 1 : 0),
                deptDto.getSiblingOrder()
        );
    }

    // 이력 객체 생성을 돕는 private 메서드
    private DeptHistory createHistory(Integer deptNo, String field, String before, String after, Emp changer) {
        return DeptHistory.builder()
                .deptNo(deptNo)
                .changeType("UPDATE")
                .fieldName(field)
                .beforeValue(before)
                .afterValue(after)
                .changer(changer)
                .build();
    }
    @Transactional
    public void deleteDept(Integer deptId){
        deptRepository.deleteById(deptId);
    }

    @Transactional
    // 부서번호로 검색해서, 해당 부서의 변경 이력들을 모두 가져온다.
    public List<DeptHistoryDto> selectAllDeptHistoryDto(Integer deptNo){
        List<DeptHistory> deptHistories = deptHistoryRepository.findByDeptNoOrderByCreatedAtDesc(deptNo);

        List<DeptHistoryDto> dtos = new ArrayList<>();
        for(DeptHistory deptHistory : deptHistories){

            DeptHistoryDto dto = DeptHistoryDto.builder()
                    .deptHistoryId(deptHistory.getDeptHistoryId())
                    .deptNo(deptHistory.getDeptNo())
                    .changeType(deptHistory.getChangeType())
                    .fieldName(deptHistory.getFieldName())
                    .beforeValue(deptHistory.getBeforeValue())
                    .afterValue(deptHistory.getAfterValue())
                    .changerName(deptHistory.getChanger().getEmpName())
                    .createdAt(deptHistory.getCreatedAt())
                    .build();

            dtos.add(dto);
        }
        return dtos;
    }
}

