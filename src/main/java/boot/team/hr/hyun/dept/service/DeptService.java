package boot.team.hr.hyun.dept.service;

import boot.team.hr.hyun.dept.dto.DeptDto;
import boot.team.hr.hyun.dept.entity.Dept;
import boot.team.hr.hyun.dept.repo.DeptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
            deptDto.setDeptId(dept.getDeptId());
            deptDto.setDeptName(dept.getDeptName());
            deptDto.setDeptLoc(dept.getDeptLoc());
            deptDto.setParentDeptId(dept.getParentDeptId());
            deptDto.setFloor(dept.getFloor());
            deptDto.setOrderNo(dept.getOrderNo());
            deptDto.setCreatedAt(dept.getCreatedAt());
            deptDto.setUpdatedAt(dept.getUpdatedAt());
            deptArr.add(deptDto);
        }
        return deptArr;
    }
    public void insertDept(DeptDto deptDto){
        Dept dept = new Dept();
        dept.setDeptId(deptDto.getDeptId());
        dept.setDeptName(deptDto.getDeptName());
        dept.setDeptLoc(deptDto.getDeptLoc());
        dept.setParentDeptId(deptDto.getParentDeptId());
        dept.setFloor(deptDto.getFloor());
        dept.setOrderNo(deptDto.getOrderNo());
        dept.setCreatedAt(LocalDateTime.now());
        dept.setUpdatedAt(LocalDateTime.now());
        deptRepository.save(dept);
    }
    public void updateDept(DeptDto deptDto){
        Dept dept = deptRepository.findByDeptId(deptDto.getDeptId())
                .orElseThrow(()-> new RuntimeException("해당 부서 없음"));
        dept.setDeptName(deptDto.getDeptName());
        dept.setDeptLoc(deptDto.getDeptLoc());
        dept.setParentDeptId(deptDto.getParentDeptId());
        dept.setFloor(deptDto.getFloor());
        dept.setOrderNo(deptDto.getOrderNo());
        dept.setUpdatedAt(LocalDateTime.now());
    }
    public void deleteDept(Integer deptId){
        deptRepository.deleteDeptByDeptId(deptId);
    }
}
