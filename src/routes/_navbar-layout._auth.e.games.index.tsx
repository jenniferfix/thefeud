import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_navbar-layout/_auth/e/games/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h2>Editor</h2>
      <h3>How it works</h3>
      <p>The game editor is where you will build up your individual games.</p>
      <p>
        A game can can consist of multiple rounds (questions), that you can
        build up in any order you wish.
      </p>
      <p>
        Each question can have up to eight (8) answers that you will have to
        manually add the details of.
      </p>
      <p>
        You can build a permanent list of questions and answers that you can use
        in multiple games if you want to host different groups. Then add as
        needed to your different games.
      </p>
    </div>
  );
}
