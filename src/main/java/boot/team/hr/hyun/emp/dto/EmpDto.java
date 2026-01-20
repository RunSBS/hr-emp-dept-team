package boot.team.hr.hyun.emp.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmpDto {
    private String empId;   // 사원번호
    private String empName; // 사원 이름

    private Integer deptNo;  // 외래키, Dept 테이블의 deptNo 컬럼과 매핑

    private String email;
    private String empRole;
    private LocalDate hireDate;

//    private String managerId; // 직속 상관 ( 규호 )

    // 사원의 생성일, 수정일은 입사일 필드가 있어서 화면에 안 보여주기에 사실상 필요없음
    @JsonFormat(pattern = "yy-MM-dd HH시 mm분")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yy-MM-dd HH시 mm분")
    private LocalDateTime updatedAt;
}