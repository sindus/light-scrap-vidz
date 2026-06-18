use regex::Regex;
use std::sync::LazyLock;

static PROGRESS_RE: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"^\[download\]\s+([\d.]+)%\s+of\s+~?[\d.]+\s*\w+\s+at\s+([\d.]+\s*\w+/s|Unknown\s*B/s)\s+ETA\s+([\d:]+|Unknown)",
    )
    .unwrap()
});

static DESTINATION_RE: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"^\[download\] Destination: (.+)$").unwrap());

#[derive(Debug, PartialEq)]
pub struct ProgressLine {
    pub percent: f32,
    pub speed: String,
    pub eta: String,
}

pub fn parse_progress_line(line: &str) -> Option<ProgressLine> {
    let caps = PROGRESS_RE.captures(line.trim())?;
    let percent: f32 = caps[1].parse().ok()?;
    let speed = caps[2].trim().to_string();
    let eta = caps[3].trim().to_string();
    Some(ProgressLine { percent, speed, eta })
}

pub fn parse_destination_line(line: &str) -> Option<String> {
    let caps = DESTINATION_RE.captures(line.trim())?;
    Some(caps[1].trim().to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_typical_progress() {
        let line = "[download]  47.3% of   18.23MiB at   1.23MiB/s ETA 00:09";
        let result = parse_progress_line(line);
        assert!(result.is_some());
        let p = result.unwrap();
        assert!((p.percent - 47.3).abs() < 0.01);
        assert!(p.speed.contains("MiB/s"));
        assert_eq!(p.eta, "00:09");
    }

    #[test]
    fn test_parse_100_percent() {
        let line = "[download] 100% of   18.23MiB at   2.45MiB/s ETA 00:00";
        let result = parse_progress_line(line);
        assert!(result.is_some());
        assert!((result.unwrap().percent - 100.0).abs() < 0.01);
    }

    #[test]
    fn test_parse_unknown_speed_and_eta() {
        let line = "[download]   0.0% of  ~18.23MiB at  Unknown B/s ETA Unknown";
        let result = parse_progress_line(line);
        assert!(result.is_some());
        let p = result.unwrap();
        assert!((p.percent - 0.0).abs() < 0.01);
        assert_eq!(p.eta, "Unknown");
    }

    #[test]
    fn test_parse_destination() {
        let line = "[download] Destination: /home/user/Downloads/my video.mp4";
        let result = parse_destination_line(line);
        assert_eq!(result, Some("/home/user/Downloads/my video.mp4".to_string()));
    }

    #[test]
    fn test_non_matching_line() {
        assert!(parse_progress_line("[info] Some other line").is_none());
        assert!(parse_destination_line("[info] Some other line").is_none());
    }

    #[test]
    fn test_parse_kilobytes() {
        let line = "[download]  12.5% of  500.00KiB at  256.00KiB/s ETA 00:02";
        let result = parse_progress_line(line);
        assert!(result.is_some());
        let p = result.unwrap();
        assert!((p.percent - 12.5).abs() < 0.01);
    }
}
