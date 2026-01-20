package boot.team.hr.hyun.dept.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeptDto {
    private Integer deptNo;
    private String deptName;
    private String deptLoc;

    private Integer parentDeptNo;
    private Integer treeLevel;
    private Integer siblingOrder;

    @JsonFormat(pattern = "yy-MM-dd HH시 mm분")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yy-MM-dd HH시 mm분")
    private LocalDateTime updatedAt;
}
