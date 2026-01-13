package boot.team.hr.hyun.outsourcing.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutsourcingAssignmentDto {

    private Long assignmentId;

    // 외래키 ID (등록/수정 시 이 ID들로 엔티티를 찾음)
    private Long empId;
    private Long companyId;

    // 화면 표시용 (조회 시 이름도 같이 보여주면 편함)
    private String empName;
    private String companyName;

    private String projectName;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}