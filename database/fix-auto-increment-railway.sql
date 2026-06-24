-- Perbaikan struktur ID untuk database Railway.
-- Jalankan di database MySQL Railway yang dipakai aplikasi.
--
-- Penyebab error seperti:
--   Field 'id_galeri' doesn't have a default value
-- adalah kolom ID belum diset AUTO_INCREMENT, sehingga saat backend INSERT
-- tanpa mengirim ID, MySQL tidak bisa membuat ID otomatis.
--
-- Versi ini juga memastikan kolom ID menjadi PRIMARY KEY terlebih dahulu.

DELIMITER $$

DROP PROCEDURE IF EXISTS fix_primary_auto_increment $$

CREATE PROCEDURE fix_primary_auto_increment(
  IN table_name_param VARCHAR(64),
  IN id_column_param VARCHAR(64)
)
BEGIN
  DECLARE primary_count INT DEFAULT 0;
  DECLARE column_count INT DEFAULT 0;
  DECLARE max_id BIGINT DEFAULT 0;
  DECLARE next_id BIGINT DEFAULT 1;

  SELECT COUNT(*)
    INTO column_count
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = table_name_param
    AND COLUMN_NAME = id_column_param;

  IF column_count = 1 THEN
    SELECT COUNT(*)
      INTO primary_count
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name_param
      AND COLUMN_NAME = id_column_param
      AND CONSTRAINT_NAME = 'PRIMARY';

    IF primary_count = 0 THEN
      SET @add_pk_sql = CONCAT(
        'ALTER TABLE `', table_name_param, '` ADD PRIMARY KEY (`', id_column_param, '`)'
      );
      PREPARE add_pk_stmt FROM @add_pk_sql;
      EXECUTE add_pk_stmt;
      DEALLOCATE PREPARE add_pk_stmt;
    END IF;

    SET @modify_sql = CONCAT(
      'ALTER TABLE `', table_name_param, '` MODIFY `', id_column_param, '` int(11) NOT NULL AUTO_INCREMENT'
    );
    PREPARE modify_stmt FROM @modify_sql;
    EXECUTE modify_stmt;
    DEALLOCATE PREPARE modify_stmt;

    SET @max_sql = CONCAT('SELECT COALESCE(MAX(`', id_column_param, '`), 0) INTO @max_id FROM `', table_name_param, '`');
    PREPARE max_stmt FROM @max_sql;
    EXECUTE max_stmt;
    DEALLOCATE PREPARE max_stmt;

    SET max_id = @max_id;
    SET next_id = max_id + 1;

    SET @auto_increment_sql = CONCAT(
      'ALTER TABLE `', table_name_param, '` AUTO_INCREMENT = ', next_id
    );
    PREPARE auto_increment_stmt FROM @auto_increment_sql;
    EXECUTE auto_increment_stmt;
    DEALLOCATE PREPARE auto_increment_stmt;
  END IF;
END $$

DELIMITER ;

CALL fix_primary_auto_increment('tb_dokumen', 'id_dokumen');
CALL fix_primary_auto_increment('tb_galeri', 'id_galeri');
CALL fix_primary_auto_increment('tb_jenis_surat', 'id_jenis');
CALL fix_primary_auto_increment('tb_kategori_galeri', 'id_kategori_galeri');
CALL fix_primary_auto_increment('tb_kategori_konten', 'id_kategori_konten');
CALL fix_primary_auto_increment('tb_konten', 'id_konten');
CALL fix_primary_auto_increment('tb_penduduk', 'id_penduduk');
CALL fix_primary_auto_increment('tb_pengguna', 'id_pengguna');
CALL fix_primary_auto_increment('tb_permohonan_dokumen', 'id_permohonan');
CALL fix_primary_auto_increment('tb_pengajuan_surat', 'id_pengajuan');
CALL fix_primary_auto_increment('tb_detail_pengajuan', 'id_detail');
CALL fix_primary_auto_increment('tb_lampiran_surat', 'id_lampiran');
CALL fix_primary_auto_increment('tb_log_aktivitas', 'id_log');
CALL fix_primary_auto_increment('tb_profil_desa', 'id_profil');
CALL fix_primary_auto_increment('tb_sejarah', 'id_sejarah');
CALL fix_primary_auto_increment('tb_struktur_organisasi', 'id_struktur');

DROP PROCEDURE IF EXISTS fix_primary_auto_increment;

-- Cek hasilnya setelah dijalankan. Kolom Extra harus berisi auto_increment.
SHOW COLUMNS FROM `tb_galeri` LIKE 'id_galeri';
SHOW COLUMNS FROM `tb_konten` LIKE 'id_konten';
SHOW COLUMNS FROM `tb_pengguna` LIKE 'id_pengguna';
SHOW COLUMNS FROM `tb_penduduk` LIKE 'id_penduduk';
SHOW COLUMNS FROM `tb_dokumen` LIKE 'id_dokumen';
SHOW COLUMNS FROM `tb_jenis_surat` LIKE 'id_jenis';
