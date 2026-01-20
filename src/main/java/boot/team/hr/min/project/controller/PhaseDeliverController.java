package boot.team.hr.min.project.controller;

import boot.team.hr.min.common.FileStorageService;
import boot.team.hr.min.project.dto.PhaseDeliverDto;
import boot.team.hr.min.project.entitiy.PhaseDeliver;
import boot.team.hr.min.project.service.PhaseDeliverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/phase-delivers")
public class PhaseDeliverController {

    private final PhaseDeliverService phaseDeliverService;
    private final FileStorageService fileStorageService;

    @PostMapping
    public ResponseEntity<PhaseDeliverDto> create(@RequestBody PhaseDeliverDto dto) {
        PhaseDeliverDto created = phaseDeliverService.create(dto);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<PhaseDeliverDto>> findAll() {
        return ResponseEntity.ok(phaseDeliverService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhaseDeliverDto> findOne(@PathVariable Long id) {
        return ResponseEntity.ok(phaseDeliverService.findOne(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(
            @PathVariable Long id,
            @RequestBody PhaseDeliverDto dto
    ) {
        phaseDeliverService.update(id, dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/phase/{phaseId}")
    public ResponseEntity<List<PhaseDeliverDto>> findByPhase(@PathVariable Long phaseId) {
        return ResponseEntity.ok(phaseDeliverService.findByPhaseId(phaseId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        phaseDeliverService.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Void> uploadDeliver(
            @RequestParam("phaseId") Long phaseId,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestPart("file") MultipartFile file
    ) {
        phaseDeliverService.upload(phaseId, name, description, file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> download(@PathVariable Long id) {
        PhaseDeliver deliver = phaseDeliverService.findEntityById(id);
        byte[] fileData = fileStorageService.loadFileAsBytes(deliver.getFile_path());

        // 한글 파일명 깨짐 방지
        String encodedFileName = URLEncoder.encode(deliver.getName(), StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + encodedFileName + "\"")
                .body(fileData);
    }
}
