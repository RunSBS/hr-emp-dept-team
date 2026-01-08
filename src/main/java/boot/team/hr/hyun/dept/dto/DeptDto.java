package boot.team.hr.hyun.dept.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class DeptDto {
    private Integer deptId;
    private String deptName;
    private String deptLoc;
    private Integer parentDeptId;
    private Integer floor;
    private Integer orderNo;
    @JsonFormat(pattern = "yy년 MM월 dd일 HH시 mm분 ss초", locale = "ko")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yy년 MM월 dd일 HH시 mm분 ss초", locale = "ko")
    private LocalDateTime updatedAt;
}
