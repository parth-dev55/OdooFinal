package com.urbanfurniture.accounting.accounting.controller;

import com.urbanfurniture.accounting.accounting.dto.JournalRequest;
import com.urbanfurniture.accounting.accounting.dto.JournalResponse;
import com.urbanfurniture.accounting.accounting.service.JournalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/journals")
@RequiredArgsConstructor
public class JournalController {
    private final JournalService journalService;

    @PostMapping
    public ResponseEntity<JournalResponse> create(@Valid @RequestBody JournalRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(journalService.create(request));
    }

    @GetMapping
    public List<JournalResponse> findAll() {
        return journalService.findAll();
    }
}
