# DCS/SCADA Simulator — Cụm Thu Hồi Hexane (Section #700)

Ứng dụng mô phỏng vận hành hệ thống **Cụm Thu Hồi Hexane — Section #700** dựa trên tài liệu quy trình công nghệ **SOP HD-W-7000-00-001**.

## 6 Phân Khu Công Nghệ
1. **Hexane Washing**: M-721, D-721, M-722, D-722, P-721A/B, D-701 (pH > 12 -> 7-8, 60°C, 0.2 kg/cm²G).
2. **Hexane Stripping**: P-702A/B, Tháp T-703 (120°C, 3.0 kg/cm²G), Reboiler E-703A/B, P-705A/B, nồng độ Low Polymer đáy 10 wt%.
3. **Low Polymer Handling & Flaker**: P-711A/B (22 kg/cm²G), E-711 (220°C), 1st Flash D-711 (3 kg/cm²G, 160°C), E-712 (180°C), 2nd Flash D-712 (-0.39 kg/cm²G), E-713, D-714, D-717, Drum Flaker M-761A/B, Máy nghiền ZZ-761A/B.
4. **Hexane Purification & Distribution**: E-704, Vent Condenser E-708 (5°C), D-702 (boot leg nước), T-704 (80°C, <= 10 ppm H2O), TK-702, P-708A/B (12 kg/cm²G), Dryer D-703A/B (< 5 ppm H2O).
5. **Oligomer Cut & Slop Hexane**: D-718, Tháp T-761 (1.5 kg/cm²G, đáy 200-210°C, dòng sườn 100-105°C), D-751/752/753 (90°C), E-751, D-754, TK-703.
6. **pH Treatment Unit**: D-781 (HCl 18%), Bể trung hòa cấp 1 D-782 (pH >12 -> ~10), Bể trung hòa cấp 2 D-783 (pH 10 -> 6-8).

## Triển khai
- Chạy cục bộ: `npm install && npm run dev`
- Deploy trực tuyến: Đẩy mã nguồn lên GitHub và Import vào Vercel.
