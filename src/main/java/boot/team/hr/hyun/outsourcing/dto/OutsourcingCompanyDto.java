package boot.team.hr.hyun.outsourcing.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OutsourcingCompanyDto {
    private Long companyId;      // 조희/수정 시 식별을 위해 필요!
    private String companyName;
    @JsonFormat(pattern = "yy-MM-dd HH시 mm분")
    private LocalDateTime createdAt;
    @JsonFormat(pattern = "yy-MM-dd HH시 mm분")
    private LocalDateTime updatedAt;
}