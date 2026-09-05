package com.chultender.backend;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Backs the hidden /Admin entry point (the brand-dot click handler in
 * Chultender.js). The password itself lives only in
 * application-local.properties (gitignored, not shipped to the
 * browser) — the old approach kept it as a plain string constant in
 * the React bundle, visible to anyone who opened dev tools.
 *
 * Still not real security (no session, no rate limiting, no hashing)
 * — just enough to keep the password out of public, static JS.
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Value("${admin.password:}")
    private String adminPassword;

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Boolean>> verify(@RequestBody Map<String, String> body) {
        String submitted = body.get("password");
        boolean ok = adminPassword != null && !adminPassword.isBlank() && adminPassword.equals(submitted);
        return ResponseEntity.ok(Map.of("ok", ok));
    }
}
