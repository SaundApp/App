package app.saund.widget;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

public record LeaderboardArtist(
        String id,
        String name,
        String username,
        int streams,
        String avatarId
) {

    public LeaderboardArtist(JSONObject json) throws JSONException {
        this(
                json.getString("id"),
                json.getString("name"),
                json.getString("username"),
                json.getInt("streams"),
                json.getString("avatarId")
        );
    }

    public String formattedStreams() {
        if (streams >= 1_000_000_000) {
            return (streams / 1_000_000_000) + "B";
        } else if (streams >= 1_000_000) {
            return (streams / 1_000_000) + "M";
        } else if (streams >= 1_000) {
            return (streams / 1_000) + "K";
        } else {
            return String.valueOf(streams);
        }
    }

    public void fetchAvatar(Consumer<Bitmap> consumer) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            CompletableFuture.supplyAsync(this::fetchAvatarSync)
                    .whenComplete((bitmap, throwable) -> {
                        if (throwable != null) {
                            throw new RuntimeException(throwable);
                        }

                        consumer.accept(bitmap);
                    });
        }
    }

    public Bitmap fetchAvatarSync() {
        try {
            URL url = new URL("https://api.saund.app/attachments/" + avatarId);
            URLConnection connection = url.openConnection();
            InputStream stream = connection.getInputStream();

            Bitmap bitmap = BitmapFactory.decodeStream(stream);

            stream.close();
            return bitmap;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
