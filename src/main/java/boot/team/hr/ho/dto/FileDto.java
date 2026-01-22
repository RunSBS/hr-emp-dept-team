package boot.team.hr.ho.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class FileDto {
    private Long fileId;// 재사용 가능
    private String fileName;
    private String filePaths;
    private Long fileSize;
}
