package boot.team.hr.min.common;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class LocalFileStorageService implements FileStorageService {

    private static final String UPLOAD_DIR = "uploads"; // 프로젝트 루트 기준

    @Override
    public String save(MultipartFile file) {
        try {
            // 업로드 디렉토리 없으면 생성
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // 파일명 충돌 방지
            String originalName = file.getOriginalFilename();
            String ext = "";

            if (originalName != null && originalName.contains(".")) {
                ext = originalName.substring(originalName.lastIndexOf("."));
            }

            String savedName = UUID.randomUUID() + ext;
            Path target = uploadPath.resolve(savedName);

            // 파일 저장
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // DB에 저장할 상대 경로 반환 (앞에 / 제거)
            return UPLOAD_DIR + "/" + savedName; // "uploads/UUID.ext" 형태

        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }

    @Override
    public byte[] loadFileAsBytes(String filePath) {
        try {
            // 프로젝트 루트 기준으로 상대 경로 연결
            Path path = Paths.get("").resolve(filePath);
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new RuntimeException("파일 읽기 실패", e);
        }
    }
}
