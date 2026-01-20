package boot.team.hr.hyun.dept.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DeptHistoryDto {
    private Long deptHistoryId;
    private Integer deptNo;

    private String changeType;
    private String fieldName;   // deptName, deptLoc 등
    private String beforeValue;
    private String afterValue;
    private String changerName; // 엔티티의 changer.getEmpId()를 담을 곳
    @JsonFormat(pattern = "yy-MM-dd HH시 mm분")
    private LocalDateTime createdAt; // 엔티티의 createdAt을 포맷팅해서 담을 곳
}
