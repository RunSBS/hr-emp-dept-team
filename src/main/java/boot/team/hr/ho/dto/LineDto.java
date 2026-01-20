package boot.team.hr.ho.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@ToString
public class LineDto {
    private Long lineId;
    private String empId;
    private Integer stepOrder;
    private boolean current;
    private LocalDateTime actionAt;
    private String empName;
}
