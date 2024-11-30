package app.saund.widget;

import android.annotation.SuppressLint;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import com.getcapacitor.Logger;

import org.json.JSONArray;
import org.json.JSONException;

import app.saund.R;

public class LeaderboardWidget extends AppWidgetProvider {

    @SuppressLint("DiscouragedApi")
    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager,
                                int appWidgetId) throws JSONException {
        SharedPreferences pref = context.getSharedPreferences("group.app.saund", Context.MODE_PRIVATE);
        String dataString = pref.getString("leaderboard.artists", "[]");
        Logger.info("LeaderboardWidget", "Loaded leaderboard widget data: " + dataString);

        JSONArray array = new JSONArray(dataString);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.leaderboard_widget);

        for (int i = 0; i < 3; i++) {
            LeaderboardArtist artist = new LeaderboardArtist(array.getJSONObject(i));
            int nameId = context.getResources().getIdentifier("artist_" + (i + 1) + "_name", "id", context.getPackageName());
            int imageId = context.getResources().getIdentifier("artist_" + (i + 1) + "_image", "id", context.getPackageName());
            int streamsId = context.getResources().getIdentifier("artist_" + (i + 1) + "_streams", "id", context.getPackageName());

            views.setTextViewText(nameId, artist.name());
            views.setTextViewText(streamsId, artist.formattedStreams() + " streams");

            views.setImageViewResource(imageId, R.drawable.blue_square);

            artist.fetchAvatar(bitmap -> {
                views.setImageViewBitmap(imageId, bitmap);
                appWidgetManager.updateAppWidget(appWidgetId, views);
            });
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            try {
                updateAppWidget(context, appWidgetManager, appWidgetId);
            } catch (JSONException e) {
                Logger.error("LeaderboardWidget", "Unable to update widget data", e);
            }
        }
    }
}