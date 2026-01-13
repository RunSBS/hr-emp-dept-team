package boot.team.hr.hyun.outsourcing.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OutsourcingCompanyDto {
    private Long companyId;      // 조희/수정 시 식별을 위해 필요!
    private String companyName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}