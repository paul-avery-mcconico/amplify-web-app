import { Component, Key, ReactChild, ReactFragment, ReactPortal} from 'react';
import Amplify, {API, graphqlOperation} from 'aws-amplify';
import {createNote, deleteNote} from './graphql/mutations';
import {listNotes} from './graphql/queries';

import {withAuthenticator, AmplifySignOut} from '@aws-amplify/ui-react';
import awsExports from './aws-exports';

Amplify.configure(awsExports);

type Props = Record<string, any>;

type State = {
    text: string;
};

class AddNote extends Component<Props, State> {
    constructor(props: Record<string, any>) {
        super(props);
        this.state = {text: ''};
    }

    handleChange = (event: { target: { value: any; }; }) => {
        this.setState({text: event.target.value});
    }

    handleClick = () => {
        this.props.addNote(this.state);
        this.setState({text: ''});
    }

    render() {
        return (
            <div style={styles.form}>
                <input
                    value={this.state.text}
                    onChange={this.handleChange}
                    placeholder="New Note"
                    style={styles.input}
                />
                <button onClick={this.handleClick} style={styles.addButton}>Add Note</button>
            </div>
        );
    }
}

type NotesProps = Record<string, any>;

class NotesList extends Component<NotesProps> {
    render() {
        return (
            <div>
                {this.props.notes.map((note: { id: Key | null | undefined; text: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined; }) =>
                    <div key={note.id} style={styles.note}>
                        <p>{note.text}</p>
                        {/* @ts-ignore */}
                        <button onClick={() => { this.props.deleteNote(note) }} style={styles.deleteButton}>x</button>
                    </div>
                )}
            </div>
        );
    }
}

class App extends Component {
    // @ts-ignore
    constructor(props) {
        super(props);
        this.state = { notes: [] };
    }

    async componentDidMount() {
        var result = await API.graphql(graphqlOperation(listNotes));
        // @ts-ignore
        this.setState({ notes: result.data.listNotes.items });
    }

    // @ts-ignore
    deleteNote = async (note) => {
        const id = {
            id: note.id
        };
        await API.graphql(graphqlOperation(deleteNote, { input: id }));
        // @ts-ignore
        this.setState({ notes: this.state.notes.filter(item => item.id !== note.id) });
    }

    // @ts-ignore
    addNote = async (note) => {
        var result = await API.graphql(graphqlOperation(createNote, { input: note }));
        // @ts-ignore
        this.state.notes.push(result.data.createNote);
        // @ts-ignore
        this.setState({ notes: this.state.notes });
    }

    render() {
        return (
            <div style={styles.container}>
                <h1>Notes App</h1>
                <AddNote addNote={this.addNote} />
                {/* @ts-ignore */}
                <NotesList notes={this.state.notes} deleteNote={this.deleteNote} />
                <AmplifySignOut />
            </div>
        );
    }
}

export default withAuthenticator(App);

const styles = {
    container: { width: 480, margin: '0 auto', padding: 20 },
    form: { display: 'flex', marginBottom: 15 },
    input: { flexGrow: 2, border: 'none', backgroundColor: '#ddd', padding: 12, fontSize: 18 },
    addButton: { backgroundColor: 'black', color: 'white', outline: 'none', padding: 12, fontSize: 18 },
    note: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, marginBottom: 15 },
    deleteButton: { fontSize: 18, fontWeight: 'bold' }
}