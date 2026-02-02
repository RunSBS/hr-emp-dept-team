package boot.team.hr.eun.attendance.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter @Setter
public class CompanyLocationRequestDto {
    private String companyName;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer allowedRadiusM;
    private String address;
    private String activeYn; // "Y" or "N"
}
