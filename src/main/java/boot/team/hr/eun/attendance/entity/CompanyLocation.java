package boot.team.hr.eun.attendance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "COMPANY_LOCATION")
@Getter @Setter
public class CompanyLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "company_location_seq")
    @SequenceGenerator(name = "company_location_seq", sequenceName = "COMPANY_LOCATION_SEQ", allocationSize = 1)
    @Column(name = "LOCATION_ID")
    private Long locationId;

    @Column(name = "COMPANY_NAME")
    private String companyName;
    @Column(columnDefinition = "NUMBER")
    private double latitude;
    @Column(columnDefinition = "NUMBER")
    private double longitude;
    @Column(name = "ALLOWED_RADIUS_M")
    private int allowedRadiusM; // 허용 반경(m)
}

