import "~/components/ExploreContainer.css";

interface ContainerProperties {
  name: string;
}

const ExploreContainer: React.FC<ContainerProperties> = ({name}) => {
  return (
    <div id="container">
      <strong>{name}</strong>

      <p>
        Explore{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://ionicframework.com/docs/components"
        >
          UI Components
        </a>
      </p>
    </div>
  );
};

export default ExploreContainer;
