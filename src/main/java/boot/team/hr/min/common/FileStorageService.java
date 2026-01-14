package boot.team.hr.min.common;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String save(MultipartFile file);

    byte[] loadFileAsBytes(String filePath);
}
