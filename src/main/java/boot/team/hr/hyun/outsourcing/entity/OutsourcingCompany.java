package boot.team.hr.hyun.outsourcing.entity;

import boot.team.hr.hyun.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "outsourcing_company")
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OutsourcingCompany extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "outsourcing_company_seq")
    @SequenceGenerator(
            name = "outsourcing_company_seq",
            sequenceName = "seq_outsourcing_company",
            allocationSize = 1
    )
    @Column(name = "company_id")
    private Long companyId;     // 업체식별자

    @Column(name = "company_name", nullable = false, length = 100)
    private String companyName;     // 업체명

    public void update(String companyName) {
        this.companyName = companyName;
    }
}