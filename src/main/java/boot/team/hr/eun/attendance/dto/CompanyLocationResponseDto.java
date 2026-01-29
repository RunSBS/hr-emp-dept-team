package boot.team.hr.eun.attendance.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class CompanyLocationResponseDto {
    private Long locationId;
    private String companyName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer allowedRadiusM;
    private String address;
    private String activeYn;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
