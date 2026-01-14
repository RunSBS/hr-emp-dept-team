package boot.team.hr.hyun.dept.service;

import boot.team.hr.hyun.dept.dto.DeptDto;
import boot.team.hr.hyun.dept.entity.Dept;
import boot.team.hr.hyun.dept.repo.DeptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeptService {
    private final DeptRepository deptRepository;

    public List<DeptDto> selectAll(){
        List<Dept> depts = deptRepository.findAll();
        List<DeptDto> deptArr = new ArrayList<>() ;
        for(Dept dept : depts){
            DeptDto deptDto = new DeptDto();
            deptDto.setDeptNo(dept.getDeptNo());
            deptDto.setDeptName(dept.getDeptName());
            deptDto.setDeptLoc(dept.getDeptLoc());
            if(dept.getParent() != null){
                deptDto.setParentDeptNo(dept.getParent().getDeptNo());
            }else {
                deptDto.setParentDeptNo(null);
            }
            deptDto.setTreeLevel(dept.getTreeLevel());
            deptDto.setSiblingOrder(dept.getSiblingOrder());

            deptDto.setCreatedAt(dept.getCreatedAt());
            deptDto.setUpdatedAt(dept.getUpdatedAt());
            deptArr.add(deptDto);
        }
        return deptArr;
    }
    public void insertDept(DeptDto deptDto){
        Dept dept = new Dept();
        dept.setDeptNo(deptDto.getDeptNo());
        dept.setDeptName(deptDto.getDeptName());
        dept.setDeptLoc(deptDto.getDeptLoc());
//        dept.setParentDeptId(deptDto.getParentDeptId());
        if(deptDto.getParentDeptNo() != null){
            Dept parentDept = deptRepository.findById(deptDto.getParentDeptNo())
                    .orElseThrow(()-> new RuntimeException("해당 부서가 없습니다."));

            dept.setParent(parentDept);
            dept.setTreeLevel(parentDept.getTreeLevel() + 1);
        }else{
            dept.setParent(null);
            dept.setTreeLevel(0);
        }
//        dept.setTreeLevel(deptDto.getTreeLevel());

        dept.setSiblingOrder(deptDto.getSiblingOrder());
        dept.setCreatedAt(LocalDateTime.now());
        dept.setUpdatedAt(LocalDateTime.now());
        deptRepository.save(dept);
    }
    @Transactional
    public void updateDept(DeptDto deptDto){
        Dept dept = deptRepository.findById(deptDto.getDeptNo())
                .orElseThrow(()-> new RuntimeException("해당 부서 없음"));
        dept.setDeptName(deptDto.getDeptName());
        dept.setDeptLoc(deptDto.getDeptLoc());
//        dept.setParentDeptId(deptDto.getParentDeptId());

        if(deptDto.getParentDeptNo() != null){
            Dept parentDept = deptRepository.findById(deptDto.getParentDeptNo())
                    .orElseThrow(()-> new RuntimeException("해당 부서가 없습니다."));

            dept.setParent(parentDept);
            dept.setTreeLevel(parentDept.getTreeLevel() + 1);
        }else{
            dept.setParent(null);
            dept.setTreeLevel(0);
        }
//        dept.setTreeLevel(deptDto.getTreeLevel());

        dept.setSiblingOrder(deptDto.getSiblingOrder());
        dept.setUpdatedAt(LocalDateTime.now());
    }
    @Transactional
    public void deleteDept(Integer deptId){
        deptRepository.deleteById(deptId);
    }
}
