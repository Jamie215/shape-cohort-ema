# Supplied asset mapping

These are original raster assets observed in the user-supplied EMA Figma file and downloaded locally for implementation. Signed download URLs are not stored in the project.

| Local file    | Figma source                                    | Usage                          |
| ------------- | ----------------------------------------------- | ------------------------------ |
| `empower.png` | Login layer `19:332`, source 293 × 153          | Empower Health Research logo   |
| `art-1.png`   | Source image `d2f569560ae4c90ca2966a8e4426181a` | Welcome day-cycle illustration |
| `art-2.png`   | Source image `053f98ae97e91cce5ce020ea2d6ce9c7` | Study/video-guide thumbnail    |
| `art-3.png`   | Source image `76a979957375ae76cfa4c202ed85acc0` | Success/confetti illustration  |

The guide thumbnail's afternoon time differs from Home; see the design review. It is artwork, not a functioning video.

`fonts/` contains Inter regular/semibold and Feather copied from the installed font packages. Local paths avoid long pnpm asset paths when serving Windows exports. Inter's SIL Open Font License and the Expo vector-icons license are included beside the fonts.

`study-placeholder.mp4` is an original 18-second silent demo guide created for the user-requested video placeholder. It uses Inter and system colors, and is not approved research content. Replace through `EXPO_PUBLIC_STUDY_VIDEO_URL`.
