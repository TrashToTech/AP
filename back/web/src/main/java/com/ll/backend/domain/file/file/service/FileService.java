package com.ll.backend.domain.file.file.service;

import com.ll.backend.domain.file.file.repository.FileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    private final FileRepository fileRepository;

    public FileService(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    public long save(MultipartFile file) {
        return 0;
    }
}
