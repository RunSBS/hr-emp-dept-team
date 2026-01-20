package boot.team.hr.ho.entity;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "APPROVAL_TYPE")
@Getter
public class ApprovalType {

    @Id
    @Column(name = "TYPE_ID")
    private Long typeId;

    @Column(name = "TYPE_NAME")
    private String typeName;

    @Column(name = "DESCRIPTION")
    private String description;
}