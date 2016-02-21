play_lengths <- ddply(all_player_tracking_data, .(gameId, gsisPlayId), function(x){
  data.frame(time_s = max(x$millisecs_since_epoch) - min(x$millisecs_since_epoch))
}) %>% 
  merge(select(all_game_data, gameId, gsisPlayId, play.playType, play.isScoring, play.playDescription)) %>% 
  arrange(desc(time_s)) %>% 
  tbl_df


## Interception
play_length_tracking_data <- dplyr::filter(all_player_tracking_data, 
                                    gsisPlayId == "4043" & 
                                      gameId == "2")
ggplot(data = my_z_sack,
       aes(x = x, y = y, colour = team, shape = team)) +
  geom_point(alpha= 0.5) +
  coord_fixed(ylim = c(0,55))

t(filter(play_lengths, gameId == "2" & gsisPlayId == "4043"))



## Write PNGS
ddply(my_z, .(millisecs_since_epoch, team), function(x){
  
  png_name <- paste0(as.character(x$millisecs_since_epoch)[1],".png")
  
  png(paste0("images/play4/",as.character(x$team)[1],"/",png_name), width=10, height=10, units="in", res=100)
  
  symbols(x = c(x$circle1_x,x$circle2_x), 
          y = c(x$circle1_y, x$circle2_y), 
          circles = c(x$circle1_r, x$circle2_r), bg = "black", xlim= c(-20,120),
          xaxt='n', yaxt='n', ann=FALSE, bty='n')
  
  
  dev.off() #only 129kb in size
  return()
})



symbols(x = c(x$circle1_x,x$circle2_x), 
        y = c(x$circle1_y, x$circle2_y), 
        circles = c(x$circle1_r, x$circle2_r), bg = "black", xlim= c(-20,120),
        xaxt='n', yaxt='n', ann=FALSE, bty='n')






library(png)
## Read PNGS
play_coverage <- ddply(my_z, .(gameId, ngsPlayId, gsisPlayId , millisecs_since_epoch), function(x){
  
  home_png <- paste0("images/play4/HOME/", as.character(x$millisecs_since_epoch)[1], '.png')
  home_img <- readPNG(home_png)

  home_gray <- home_img[,,1]+home_img[,,2]+home_img[,,3]+home_img[,,4]
  home_gray <- home_gray/max(home_gray)
  home_covered <- home_gray < 0.5
  
  away_png <- paste0("images/play4/AWAY/", as.character(x$millisecs_since_epoch)[1], '.png')
  away_img <- readPNG(away_png)
  
  away_gray <- away_img[,,1]+away_img[,,2]+away_img[,,3]+away_img[,,4]
  away_gray <- away_gray/max(away_gray)
  away_covered <- away_gray < 0.5
  
  data.frame(home_cover_px = sum(home_covered),
             away_cover_px = sum(away_covered),
             overlap_px    = sum(home_covered & away_covered),
             total_px      = prod(dim(home_covered)))
})
play_coverage$coverage <- play_coverage$overlap_px * 100 / play_coverage$home_cover_px
play_coverage_smooth = c(play_coverage$coverage)

play_coverage$coverage_smooth <- stats::filter(play_coverage_smooth, rep(1/4, 4), method = c("convolution"), sides = 2)
write.csv(play_coverage, file = '~/Desktop/NFLHackathon/interception_coverage_2.csv', row.names = FALSE)

plot(play_coverage$coverage_smooth, typ = 'l')
