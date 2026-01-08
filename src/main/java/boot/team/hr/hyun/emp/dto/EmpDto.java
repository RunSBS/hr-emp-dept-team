package boot.team.hr.hyun.emp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class EmpDto {
    private String empId;   // React의 empId와 매핑
    private String empName; // React의 empName과 매핑
    private String deptId;  // React의 deptId와 매핑
    private String email;
    private String role;
    @JsonFormat(pattern = "yy년 MM월 dd일 HH시 mm분 ss초",locale = "ko")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yy년 MM월 dd일 HH시 mm분 ss초",locale = "ko")
    private LocalDateTime updatedAt;
}