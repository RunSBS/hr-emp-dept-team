package boot.team.hr.hyun.emp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "EMP_SKILL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class EmpSkill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long skillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_id", nullable = false)
    private Emp empId;

    @Column(name = "skill_name", nullable = false) // 예: Python, React, Java
    private String skillName;

    @Column(name = "years") // 경력 연수
    private Integer years;

    @Column(name = "skill_level") // 숙련도 (상, 중, 하 등)
    private String skillLevel;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist(){
        this.createdAt = LocalDateTime.now();
    }
    @PreUpdate
    public void preUpdate(){
        this.updatedAt = LocalDateTime.now();
    }

    public void update(String skillName, Integer years, String skillLevel){
        this.skillName = skillName;
        this.years = years;
        this.skillLevel = skillLevel;
    }
}