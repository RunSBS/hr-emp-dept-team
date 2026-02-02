package boot.team.hr.eun.attendance.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

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

    @Column(name = "ADDRESS", length = 200)
    private String address;

    @Column(name = "ACTIVE_YN", length = 1, nullable = false)
    private String activeYn; // 'Y'/'N'

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (activeYn == null) activeYn = "Y";
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

}

